---
oj: dmy
pid: '416'
title: '[R67B] 朝向'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$。

## 思路

顺时针方向依次为 `N`、`E`、`S`、`W`，把朝向映射为下标 0～3：`R`（顺时针 90°）下标加 1 取模 4，`L`（逆时针 90°）下标加 3 取模 4。初始下标由初始朝向确定，逐步执行操作并把每次结果直接输出。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let dn = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let dirs = "NESW"
    var idx: Int64 = 0
    if (dn[0] == "E") {
        idx = 1
    } else if (dn[0] == "S") {
        idx = 2
    } else if (dn[0] == "W") {
        idx = 3
    }
    let n = Int64.parse(dn[1])
    let s = reader.readln().getOrThrow()
    for (i in 0..n) {
        if (s[i] == UInt8(0x52)) {
            idx = (idx + 1) % 4
        } else {
            idx = (idx + 3) % 4
        }
        print(Rune(UInt32(dirs[idx])))
    }
    println()
    return 0
}
```

要点：

- 逆时针转 90° 等价于顺时针转 270°，即下标加 3 取模，与顺时针共用同一套取模运算。
- `'R'` 的 ASCII 码是 `0x52`，字符串按字节比较即可区分 `L` / `R`。
- 朝向字符从 `"NESW"` 里按下标取字节，转成 `Rune` 后直接用 `print` 输出。
