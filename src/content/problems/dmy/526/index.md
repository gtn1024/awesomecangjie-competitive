---
oj: dmy
pid: '526'
title: '[R82D] 控制'
difficulty: 提高
tags:
  - 计数
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2\times 10^5$，$1 \le m \le 2\times 10^5$，$0 \le e \le 2\times 10^5$。

## 思路

把每台设备 $v$ 看成它关联的控制器集合 $S_v$。选中两台控制器 $\{a,b\}$ 后，设备 $v$ 能完成检查当且仅当 $S_v\subseteq\{a,b\}$。因此只有 $|S_v|\le 2$ 的设备有可能被算进答案：

- $|S_v|=0$：与选择无关，恒计入，设有 $z$ 台；
- $|S_v|=1$，$S_v=\{u\}$：计入当且仅当 $u\in\{a,b\}$；
- $|S_v|=2$，$S_v=\{u,w\}$：计入当且仅当 $\{a,b\}=\{u,w\}$；
- $|S_v|\ge 3$：永远不计入。

记 $c_u$ 为满足 $S_v=\{u\}$ 的设备数，$t_{u,w}$ 为满足 $S_v=\{u,w\}$（$u<w$）的设备数，则答案为
$$
z+\max_{a<b}\bigl(c_a+c_b+t_{a,b}\bigr).
$$

直接枚举 $O(n^2)$ 对不可行，按 $t_{a,b}$ 是否为零分两类处理：

1. **$t_{a,b}=0$ 的对。** 此时值就是 $c_a+c_b$，最大者取 $c$ 中最大的两个（控制器互不相同）之和 $M_1+M_2$。
2. **$t_{a,b}>0$ 的对。** 这样的对必定来自某台 $|S_v|=2$ 的设备，数量只有 $O(m)$ 个：把每台二度设备给出的无序对 $(u,w)$ 收进数组，编码成 $u\cdot(n+1)+w$（$u<w$）后排序，同一编码的连续段长度就是 $t_{u,w}$，逐段计算 $c_u+c_w+t_{u,w}$。

两类取最大值即为答案。$t_{a,b}>0$ 的对如果恰好也是 $c$ 最大的两台，会同时被两类覆盖，取最大不会出错，也不会漏解。

需要注意的是 $|S_v|\ge 3$ 的设备在统计时就应丢弃：它既不能贡献 $c$，也不能贡献 $t$，否则会让某对控制器的得分虚高。

## 复杂度

时间为 $O(n+m+e\log e)$（$e$ 条记录读入，二度设备的对排序）；空间为 $c$、设备度数、每台设备的前两个控制器以及对的编码数组，均为 $O(n+m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.sort.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = nextInt()
    let e = nextInt()
    let c = Array<Int64>(n + 1, { _ => 0 })
    let deg = Array<Int64>(m + 1, { _ => 0 })
    let f1 = Array<Int64>(m + 1, { _ => 0 })
    let f2 = Array<Int64>(m + 1, { _ => 0 })
    for (_ in 0..e) {
        let u = nextInt()
        let v = nextInt()
        deg[v] += 1
        if (deg[v] == 1) {
            f1[v] = u
        } else if (deg[v] == 2) {
            f2[v] = u
        }
    }
    let base = n + 1
    var z: Int64 = 0
    let keys = Array<Int64>(m, { _ => 0 })
    var kc: Int64 = 0
    for (v in 1..=m) {
        let d = deg[v]
        if (d == 0) {
            z += 1
        } else if (d == 1) {
            c[f1[v]] += 1
        } else if (d == 2) {
            var a = f1[v]
            var b = f2[v]
            if (a > b) {
                let t = a
                a = b
                b = t
            }
            keys[kc] = a * base + b
            kc += 1
        }
    }
    var best1: Int64 = 0
    var best2: Int64 = 0
    for (u in 1..=n) {
        let x = c[u]
        if (x > best1) {
            best2 = best1
            best1 = x
        } else if (x > best2) {
            best2 = x
        }
    }
    var ans = z + best1 + best2
    sort(keys)
    var i = m - kc
    while (i < m) {
        var j = i + 1
        while (j < m && keys[j] == keys[i]) {
            j += 1
        }
        let a = keys[i] / base
        let b = keys[i] % base
        let val = z + c[a] + c[b] + (j - i)
        if (val > ans) {
            ans = val
        }
        i = j
    }
    println(ans)
}
```

</details>
